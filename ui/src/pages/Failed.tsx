import TaskListPage from "../components/TaskListPage.tsx";

export default () => (
  <TaskListPage
    header="Failed Tasks"
    endpoint="/api/tasks/failed"
    dateToShow="endedAt"
  />
);
