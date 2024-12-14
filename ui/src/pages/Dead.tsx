import JobListPage from "../components/JobListPage.tsx";

export default () => (
  <JobListPage
    header="Dead Jobs"
    endpoint="/api/jobs/dead"
    dateToShow="endedAt"
  />
);
