import { Button } from "@superset/ui/button";
import { Card } from "@superset/ui/card";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-24">
			<Card className="p-8 max-w-2xl">
				<h1 className="text-4xl font-bold mb-4">Welcome to Superset</h1>
				<p className="text-muted-foreground mb-6">
					This is a Next.js application using shared UI components from the
					monorepo.
				</p>
				<div className="flex gap-4">
					<Button>Get Started</Button>
					<Button variant="outline">Learn More</Button>
				</div>
			</Card>
		</main>
	);
}
