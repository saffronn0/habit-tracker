type Props = {
  columns: string[];
  rows: (string | number)[][];
};

export default function TableToggle({ columns, rows }: Props) {
  return (
    <details className="mt-3 text-xs">
      <summary className="cursor-pointer select-none text-muted hover:text-foreground">
        View as table
      </summary>
      <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-card-border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-card-border bg-black/[0.02]">
              {columns.map((c) => (
                <th key={c} className="px-2.5 py-1.5 text-left font-medium text-muted">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-card-border last:border-0">
                {row.map((cell, j) => (
                  <td key={j} className="px-2.5 py-1.5 tabular-nums">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
