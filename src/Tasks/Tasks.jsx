import { useEffect, useState } from "react";
import { getTasks, deleteTask, updateTask } from "../../api/tasks";
import AddTaskForm from "../../components/AddTaskForm";

function Tasks() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    const data = await getTasks();
    setTasks(data);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>All Tasks</h1>

      <AddTaskForm onCreated={loadTasks} />

      {tasks.map(task => (
        <div key={task.id}>
          <strong>{task.title}</strong>
          <p>{task.description}</p>
        </div>
      ))}
    </div>
  );
}

export default Tasks;
