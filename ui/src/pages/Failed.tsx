import JobListPage from "../components/JobListPage.tsx";

export default () => (
  <JobListPage
    header="Failed Jobs"
    endpoint="/api/jobs/failed"
    dateToShow="endedAt"
  />
);
