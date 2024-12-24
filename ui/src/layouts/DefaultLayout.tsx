import {
  createResource,
  onCleanup,
  onMount,
  type ParentProps,
  Show,
} from "solid-js";
import IconWrenchScrewdriverSolid from "../components/IconWrenchScrewdriverSolid.tsx";
import IconSquare3Stack3DSolid from "../components/IconSquare3Stack3DSolid.tsx";
import IconExclaimationTriangleSolid from "../components/IconExclaimationTriangleSolid.tsx";
import IconBellAlertSolid from "../components/IconBellAlertSolid.tsx";
import { A } from "@solidjs/router";
import type { GetCountsResponse } from "@aklinker1/job-queue";

export default (props: ParentProps) => {
  const [counts, countsQueryActions] = createResource<GetCountsResponse>(() =>
    fetch(__BASE_PATH__ + "/api/counts").then((res) => res.json())
  );

  let interval: number | undefined;
  onMount(() =>
    void (interval = setInterval(() => countsQueryActions.refetch(), 5e3))
  );
  onCleanup(() => clearInterval(interval));

  return (
    <>
      <nav class="fixed top-0 inset-x-0">
        <ul class="flex h-14 bg-white">
          <li>
            <A class="nav-item" activeClass="bg-black:5" href="/" end>
              <IconWrenchScrewdriverSolid class="size-5" />
              <span class="hidden sm:block">{__TITLE__}</span>
            </A>
          </li>
          <li>
            <A class="nav-item" activeClass="bg-black:5" href="/enqueued">
              <IconSquare3Stack3DSolid class="size-5" />
              <span class="hidden md:block">Enqueued</span>
              <Show when={counts()}>
                {(counts) => (
                  <span class="badge badge-state-enqueued font-mono">
                    {counts().enqueued}
                  </span>
                )}
              </Show>
            </A>
          </li>
          <li>
            <A class="nav-item" activeClass="bg-black:5" href="/failed">
              <IconExclaimationTriangleSolid class="size-5" />
              <span class="hidden md:block">Failed</span>
              <Show when={counts()}>
                {(counts) => (
                  <span class="badge badge-state-failed font-mono">
                    {counts().failed}
                  </span>
                )}
              </Show>
            </A>
          </li>
          <li>
            <A class="nav-item" activeClass="bg-black:5" href="/dead">
              <IconBellAlertSolid class="size-5" />
              <span class="hidden md:block">Dead</span>
              <Show when={counts()}>
                {(counts) => (
                  <span class="badge badge-state-dead font-mono">
                    {counts().dead}
                  </span>
                )}
              </Show>
            </A>
          </li>
        </ul>
        <div class="h-2 bg-gradient-to-b bg-gradient-from-white:100 bg-gradient-to-white:0" />
      </nav>
      <div class="mt-16">
        {props.children}
      </div>
    </>
  );
};
