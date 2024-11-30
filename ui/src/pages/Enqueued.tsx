import TaskListPage from "../components/TaskListPage.tsx";

export default () => (
  <TaskListPage
    header="Enqueued Tasks"
    endpoint="/api/tasks/enqueued"
    dateToShow="addedAt"
  />
);
