import "./App.css";
import { VirtualTable } from "../entities/item/ui/VirtualTable.new";

function App() {
  return (
    <div className="container">
      <h1>Список с тестовыми значениями</h1>
      <VirtualTable />
    </div>
  );
}

export default App;
