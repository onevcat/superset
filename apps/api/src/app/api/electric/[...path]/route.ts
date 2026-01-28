import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client";
const ELECTRIC_ENABLED = process.env.SUPERSET_ENABLE_ELECTRIC === "1";
const ELECTRIC_DISABLED =
	process.env.SUPERSET_DISABLE_ELECTRIC === "1" ||
	process.env.ELECTRIC_DISABLED === "1" ||
	!ELECTRIC_ENABLED;

export async function GET(request: Request): Promise<Response> {
	if (ELECTRIC_DISABLED) {
		return new Response(null, { status: 204 });
	}

	const [{ auth }, { env }, { buildWhereClause }] = await Promise.all([
		import("@superset/auth/server"),
		import("@/env"),
		import("./utils"),
	]);

	const sessionData = await auth.api.getSession({
		headers: request.headers,
	});
	if (!sessionData?.user) {
		return new Response("Unauthorized", { status: 401 });
	}

	const organizationId = sessionData.session.activeOrganizationId;
	if (!organizationId) {
		return new Response("No active organization", { status: 400 });
	}

	const url = new URL(request.url);
	const originUrl = new URL(env.ELECTRIC_URL);
	originUrl.searchParams.set("secret", env.ELECTRIC_SECRET);

	url.searchParams.forEach((value, key) => {
		if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
			originUrl.searchParams.set(key, value);
		}
	});

	const tableName = url.searchParams.get("table");
	if (!tableName) {
		return new Response("Missing table parameter", { status: 400 });
	}

	const whereClause = await buildWhereClause(
		tableName,
		organizationId,
		sessionData.user.id,
	);
	if (!whereClause) {
		return new Response(`Unknown table: ${tableName}`, { status: 400 });
	}

	originUrl.searchParams.set("table", tableName);
	originUrl.searchParams.set("where", whereClause.fragment);
	whereClause.params.forEach((value, index) => {
		originUrl.searchParams.set(`params[${index + 1}]`, String(value));
	});

	if (tableName === "auth.apikeys") {
		originUrl.searchParams.set(
			"columns",
			"id,name,start,created_at,last_request",
		);
	}

	let response = await fetch(originUrl.toString());

	if (response.headers.get("content-encoding")) {
		const headers = new Headers(response.headers);
		headers.delete("content-encoding");
		headers.delete("content-length");
		response = new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers,
		});
	}

	return response;
}
