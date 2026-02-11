export default async function DraftResultsPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Draft Results</h1>
        <p className="text-gray-400">Draft ID: {draftId}</p>
      </div>

      <div className="p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg text-center">
        <p className="text-gray-400">Coming soon - Final results and standings</p>
      </div>
    </div>
  );
}
