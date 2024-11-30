import TaskListPage from "../components/TaskListPage.tsx";

export default () => (
  <TaskListPage
    header="Dead Tasks"
    endpoint="/api/tasks/dead"
    dateToShow="endedAt"
  />
);
