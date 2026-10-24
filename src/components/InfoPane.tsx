import './InfoPane.css'

interface InfoPaneProps {
  onClose: () => void
}

export default function InfoPane({ onClose }: InfoPaneProps) {
  return (
    <div className="info-pane">
      <div className="info-pane-header">
        <h2>About this application</h2>
        <button className="close-button-header" onClick={onClose} aria-label="Close info panel">✕</button>
      </div>

      <p className="info-intro">
        <strong>Machinery of Government</strong> is an interactive map of UK central government — showing
        how departments, ministers, agencies, public bodies, and other organisations relate to and
        oversee one another.
      </p>

      <section className="info-section">
        <h3>Views</h3>
        <dl className="info-controls">
          <dt>Full view</dt>
          <dd>The default view. Shows every element in the network simultaneously, arranged in concentric rings by constitutional distance from the Prime Minister. Hover any node to see its name in a tooltip beside the cursor. Click to select an element — it is highlighted with an amber border and its name is shown as a label. Click <strong>⊡ Focus</strong> in the chart toolbar to switch to focus view.</dd>

          <dt>Focus view</dt>
          <dd>Shows the selected element at the centre, with its parents, grandparents, children, and grandchildren arranged radially. Click any node to re-focus the chart on it. Click <strong>⊞ Full</strong> to return to full view.</dd>

          <dt>Dark / Light mode</dt>
          <dd>Toggle between light and dark appearances using the <strong>☾</strong> / <strong>☀</strong> button in the chart toolbar (or the moon icon in the mobile navigation bar).</dd>

          <dt>Legend</dt>
          <dd>Click <strong>☰ Legend</strong> in the chart toolbar to show or hide the key. The legend is visible on desktop only; on mobile, use <strong>Categories</strong> in the navigation bar instead. In full view the Groups section is hidden, as group nodes only appear in focus view.</dd>

          <dt>Jurisdiction filter</dt>
          <dd>Click the <strong>🌍 Territory</strong> button in the chart toolbar to filter the chart by jurisdiction. Selecting a territory (e.g. England) highlights all elements whose remit covers that territory — including broader jurisdictions such as UK-wide and GB bodies. The filter applies across both views, and the <strong>↺</strong> reset button clears it. The selected jurisdiction is shown on each element's info tab.</dd>
        </dl>
      </section>

      <section className="info-section">
        <h3>How to navigate</h3>
        <dl className="info-controls">
          <dt>Select an element</dt>
          <dd>Click any node on the chart. On desktop, the element pane opens with details, relationships, and tabs for Powers, Budget, Staff, and Org. On mobile, the element's name and type appear in a bar at the bottom — tap <strong>Select</strong> to update the chart, then <strong>Details →</strong> to open the full pane.</dd>

          <dt>Random element</dt>
          <dd>Click the <strong>⚄</strong> button (top-right of the chart) to jump to a randomly selected element from the entire database.</dd>

          <dt>Navigate relationships</dt>
          <dd>Click any parent or child entry in the element pane to jump to that element and re-centre the chart around it.</dd>

          <dt>Pan the chart</dt>
          <dd>Click and drag on the background.</dd>

          <dt>Zoom</dt>
          <dd>Scroll wheel, or pinch on a trackpad / touchscreen.</dd>

          <dt>Reset / re-centre</dt>
          <dd>Click the <strong>↺</strong> button (top-right of the chart) to reset the layout, re-centre on the PM, clear the current selection, and clear any active jurisdiction filter.</dd>

          <dt>Search</dt>
          <dd>Click <strong>Search</strong> in the header to open a search panel. Search by name, or filter by one or more tags. In full view, matching elements are highlighted across the whole network with connections between them shown.</dd>

          <dt>Browse by category</dt>
          <dd>Click the category badge (e.g. "Ministerial Department") on any element to see all elements of that type.</dd>

          <dt>Browse by tag</dt>
          <dd>Click a tag pill (e.g. "Regulator" or "Health") on any element to see all organisations sharing that tag.</dd>
        </dl>
      </section>

      <section className="info-section">
        <h3>Element detail tabs</h3>
        <dl className="info-controls">
          <dt>Info</dt>
          <dd>Description, role, current holder, jurisdiction, tags, and all parent / child relationships.</dd>

          <dt>Powers</dt>
          <dd>Powers, duties, functions, and responsibilities — with the underpinning legislation, statutory instrument, prerogative, case law, or constitutional convention, and a link to the source text on legislation.gov.uk where available. Shown where data has been entered.
            <dl className="info-controls info-controls-nested">
              <dt>Power</dt>
              <dd>A discretionary authority to act — something the body or official <em>may</em> do. Includes prerogative powers, statutory discretions, and executive powers conferred by legislation.</dd>
              <dt>Duty</dt>
              <dd>A legal obligation to act in a particular way. The holder <em>must</em> do this; failure may be unlawful and subject to judicial review or statutory sanction.</dd>
              <dt>Function</dt>
              <dd>An ongoing role or activity carried out in the exercise of office — broader than a single power or duty, and often a combination of both.</dd>
              <dt>Responsibility</dt>
              <dd>A political or constitutional accountability — not necessarily enforceable in court, but a recognised obligation to Parliament, the public, or the Sovereign.</dd>
            </dl>
          </dd>

          <dt>Budget</dt>
          <dd>2024–25 final outturn spending from HM Treasury OSCAR data — net and gross expenditure, income, DEL/AME split, and a breakdown by economic type, programme, or arm's-length body (where available). Links to the body's annual report collection on GOV.UK.</dd>

          <dt>Staff</dt>
          <dd>Civil Service headcount as at 31 March 2026 from the Cabinet Office Civil Service Statistics. Shows a grade breakdown (SCS, Grade 6/7, SEO/HEO, EO, AA/AO) and, for departments, a breakdown by sub-organisation. Clicking a sub-organisation row navigates to that element.</dd>

          <dt>Org</dt>
          <dd>Senior leadership structure as a collapsible hierarchy, sourced from the organogram CSVs published on the National Data Library / data.gov.uk. Shows the name, grade (SCS4–SCS1), job title, and unit of each Senior Civil Service post and who they report to. Names and titles withheld under FOIA exemptions appear as "Redacted". The reference date and a link to the source data are shown at the bottom. The Cabinet Office and eighteen further departments show the senior posts in their published organograms, from SCS4 to SCS1 where those grades are included. Lines below SCS3 start collapsed.</dd>
        </dl>
      </section>

      <section className="info-section">
        <h3>Classification</h3>
        <p>Every element has a <strong>category</strong> and <strong>subtype</strong>:</p>
        <table className="info-table">
          <thead>
            <tr><th>Category</th><th>Subtypes</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Official</td>
              <td>Prime Minister, Cabinet Minister, Junior Minister, Civil Servant, Independent Official</td>
            </tr>
            <tr>
              <td>Department</td>
              <td>Ministerial Department, Non-Ministerial Department, Executive Agency, Division / Directorate</td>
            </tr>
            <tr>
              <td>Body</td>
              <td>Executive NDPB, Advisory NDPB, Public Corporation, Royal Charter Body, Tribunal, Other Body</td>
            </tr>
            <tr>
              <td>Group</td>
              <td>Cabinet, Other Group</td>
            </tr>
          </tbody>
        </table>
        <p className="info-note">
          Elements also carry <strong>type tags</strong> (e.g. Regulator, Tribunal, NHS Body) and
          <strong> sector tags</strong> (e.g. Health, Defence, Digital / Technology) for cross-cutting
          search and filtering. Departments and bodies also have a <strong>jurisdiction</strong> (e.g. UK, England, Wales, Scotland, Northern Ireland, Crown Dependencies, Overseas Territories) reflecting the geographic scope of their remit.
        </p>
      </section>

      <section className="info-section">
        <h3>Budget data</h3>
        <p>
          Budget figures are drawn from HM Treasury's{' '}
          <a href="https://www.gov.uk/government/publications/oscar-publications" target="_blank" rel="noopener noreferrer">
            OSCAR (Online System for Central Accounting and Reporting)
          </a>{' '}
          2024–25 final outturn dataset. Figures are in £ thousands and represent actual spend
          for the full financial year. Negative values represent income or receipts.
        </p>
        <dl className="info-controls info-controls-wrap">
          <dt>DEL (Departmental Expenditure Limit)</dt>
          <dd>Day-to-day spending within fixed limits set at Spending Reviews. Split into Admin DEL (running costs) and Programme DEL (frontline delivery).</dd>

          <dt>AME (Annually Managed Expenditure)</dt>
          <dd>Demand-driven spending outside fixed limits — primarily benefits, pensions, and debt interest.</dd>

          <dt>Income</dt>
          <dd>Some departments receive income that offsets their gross expenditure — for example, fee-funded bodies such as Companies House, DVLA, and the Intellectual Property Office charge for their services; departments running shared services (e.g. Cabinet Office, FCDO) receive income from other government bodies; and some departments historically received EU or international reimbursements. Where material income exists, the chart section shows an <em>Expenditure / Income</em> toggle so both can be explored.</dd>
        </dl>
      </section>

      <section className="info-section">
        <h3>Data coverage</h3>
        <ul className="info-list">
          <li>All Cabinet ministers with current role holders</li>
          <li>All junior ministers across every department</li>
          <li>Permanent Secretaries and key independent officials</li>
          <li>All ministerial and non-ministerial departments</li>
          <li>40+ executive agencies</li>
          <li>100+ executive and advisory NDPBs</li>
          <li>Tribunals, ombudsmen, regulators, and public corporations</li>
          <li>Government professions and cross-cutting Cabinet Office functions</li>
          <li>Powers and legislation data for all Cabinet ministers and selected independent officials</li>
          <li>Budget data for 37 department groups (2024–25 outturn)</li>
          <li>Staff headcount for all ministerial and non-ministerial departments and their agencies (31 March 2026, with 2025 for comparison)</li>
          <li>Senior organogram for the Cabinet Office (31 March 2026) and SCS posts for 18 further departments</li>
        </ul>
        <p className="info-note">
          Data reflects the UK government structure as at mid-2026. Role holders and
          organisational structures change frequently; always verify against{' '}
          <a href="https://www.gov.uk/government/organisations" target="_blank" rel="noopener noreferrer">GOV.UK</a>{' '}
          for the most current position.
        </p>
      </section>

      <section className="info-section">
        <h3>Limitations</h3>
        <ul className="info-list">
          <li>Budget data covers department-level groups; individual agencies and NDPBs do not have separate budget entries unless they appear as a distinct OSCAR organisation.</li>
          <li>OSCAR body-level spend figures aggregate all transactions attributed to an organisation code and may differ from figures in individual annual reports.</li>
          <li>The focus view shows up to two levels of children and all ancestors for any selected element; the full view shows the entire network.</li>
        </ul>
      </section>

      <section className="info-section">
        <h3>Disclaimer</h3>
        <p className="info-disclaimer">
          The information in this application is provided for general reference purposes only. While every effort has been made to ensure accuracy, the data may be incomplete, incorrect, or out of date. Government structures, ministerial appointments, and organisational relationships change frequently. The author makes no representations or warranties of any kind, express or implied, as to the accuracy, completeness, or fitness for any particular purpose of the information contained herein. The author accepts no liability whatsoever for any loss, damage, or inconvenience arising from reliance on information in this application. Always verify against official sources such as{' '}
          <a href="https://www.gov.uk/government/organisations" target="_blank" rel="noopener noreferrer">GOV.UK</a>.
        </p>
      </section>

      <footer className="info-footer">
        <p className="info-copyright">© MMXXVI Harry C. Rushworth. Non-commercial use permitted with attribution.</p>
        <p className="info-ogl">
          Contains public sector information licensed under the{' '}
          <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" target="_blank" rel="noopener noreferrer">
            Open Government Licence v3.0
          </a>
          , including HM Treasury OSCAR data, Cabinet Office Civil Service Statistics, and senior organogram data from the National Data Library.
        </p>
      </footer>
    </div>
  )
}
