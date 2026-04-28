import { useEffect } from "react";
import { getTasks } from "./api/tasks";

function TestAPI() {
  useEffect(() => {
    getTasks().then(data => console.log("Tasks:", data));
  }, []);

  return <div style={{ padding: 20 }}>Testing API… check console</div>;
}

export default TestAPI;
