import { matrixColumns, skillGroups } from "@/data/skills";

/** Skills as evidence: a table of what was used where, so nobody has to take a list on trust. */
export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="sheet lazy-block border-t border-line">
      <div className="wrap py-16 md:py-24">
        <h2 id="skills-title" className="t-h2">
          Skills, and where I used them
        </h2>
        <p className="t-read muted mt-2 max-w-2xl">No percentage bars. A filled square means it&apos;s in that project&apos;s code or that internship&apos;s work. An empty row means I&apos;ve studied it but can&apos;t point to a project here yet.</p>

        <p className="t-mono muted mt-6 md:hidden">Scroll the table sideways →</p>
        <div className="no-scrollbar relative mt-3 overflow-x-auto md:mt-10" tabIndex={0} role="region" aria-label="Skills by project, scrollable table">
          <table className="w-full min-w-[51.25rem] border-collapse">
            <thead>
              <tr className="border-b border-fg align-bottom">
                <th scope="col" className="sticky left-0 z-[1] bg-bg pb-2 pr-4 text-left">
                  <span className="sr-only">Skill</span>
                </th>
                {matrixColumns.map((c) => (
                  <th key={c.key} scope="col" className="t-mono w-[8.5%] px-1 pb-2 text-left font-medium leading-tight">
                    {c.key === "internships" ? (
                      <a href="#experience" className="tap hover:underline">
                        {c.label}
                      </a>
                    ) : (
                      <a href={`#work-${c.key}`} className="tap hover:underline">
                        {c.label}
                      </a>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            {skillGroups.map((g) => (
              <tbody key={g.label}>
                <tr>
                  <th colSpan={matrixColumns.length + 1} scope="colgroup" className="pb-1.5 pt-6 text-left text-[0.95rem] font-bold">
                    <span className="sticky left-0">{g.label}</span>
                  </th>
                </tr>
                {g.skills.map((s) => (
                  <tr key={g.label + s.name} className="group border-t border-line hover:bg-bg-2">
                    <th scope="row" className="sticky left-0 z-[1] whitespace-nowrap bg-bg py-1.5 pr-4 text-left text-[0.95rem] font-medium group-hover:bg-bg-2">
                      {s.name}
                    </th>
                    {matrixColumns.map((c) => {
                      const on = s.used.includes(c.key);
                      return (
                        <td key={c.key} className="px-1 py-1.5">
                          <span className={`block h-4 w-full max-w-10 ${on ? "bg-accent" : ""}`} aria-hidden />
                          <span className="sr-only">{on ? `Used in ${c.label}` : ""}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </section>
  );
}
