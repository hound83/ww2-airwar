# Start a new European Air War Atlas conversation

The repository and its current documents are the source of truth. Do not upload an old chat or assume that version numbers and previews from previous conversations remain current.

## Planning prompt

> Continue the European Air War Atlas website at https://github.com/hound83/ww2-airwar. Read the current README.md, AGENTS.md and relevant parts of docs/STATUS_AND_NEXT_STEPS.md. This is separate from the aircraft physics repository. Review the actual current website, historical evidence and priorities. Help me choose one meaningful, coherent outcome with measurable user-facing acceptance checks. Keep it concise and identify any genuine product decisions I must make.

## Implementation prompt

> Work in https://github.com/hound83/ww2-airwar using its latest branch, pull requests, README.md, AGENTS.md and task-relevant evidence. Deliver **[ONE COHERENT ATLAS MILESTONE]** end to end: investigate, implement, test the historical data and complete user journey, inspect the browser result, and repair in-scope problems. Preserve provenance and the separate physics boundary. Take routine technical decisions independently. Create a reviewable PR and, if every applicable release gate is verified and GitHub permits it, merge and verify the published website without asking for another GO. Otherwise leave a precise tested checkpoint and blocker. Report only real before/after evidence, tests, live status and unresolved limitations.

## Boundaries and useful starting points

- The Atlas website is independent of the [aircraft physics model](https://github.com/hound83/WW2-Aircraft-Physics-Simulator). Integrate a new physics model or promote an opt-in preview only when the assignment explicitly authorizes that product change and the documented gates pass.
- Use [project status](STATUS_AND_NEXT_STEPS.md), [physics integration rules](ATLAS_PHYSICS_INTEGRATION.md), [historical source audit](../SOURCE_AUDIT.md) and relevant research records only as needed.
- Check the actual default website and any active previews; never assume hardcoded version labels are still current.
- Keep significant decisions and results in GitHub, not large handover archives. Start a fresh conversation when practical; continuation must work from repository state alone.

Website: https://hound83.github.io/ww2-airwar/
