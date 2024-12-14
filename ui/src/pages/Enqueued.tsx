import JobListPage from "../components/JobListPage.tsx";

export default () => (
  <JobListPage
    header="Enqueued Jobs"
    endpoint="/api/jobs/enqueued"
    dateToShow="addedAt"
  />
);
