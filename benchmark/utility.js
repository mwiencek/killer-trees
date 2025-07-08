export async function runSuites(suites) {
  for (const bench of suites) {
    console.log(bench.name);
    await bench.run()
    console.table(bench.table.call({
      tasks: bench.tasks.sort((a, b) => (
        (b.result?.throughput?.mean ?? 0) - (a.result?.throughput?.mean ?? 0)
      )),
    }));
  }
}
