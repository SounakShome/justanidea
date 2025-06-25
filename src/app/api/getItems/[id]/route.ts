export async function GET(request: Request, { params }: { params: { id: string } }) {
    const id = await params.id;
    try {
        console.log(`Fetching items for ID: ${id}`);
        return new Response(JSON.stringify(id), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        let errorMessage = 'An unknown error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return new Response(JSON.stringify({ message: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}