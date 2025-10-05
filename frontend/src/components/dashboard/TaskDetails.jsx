import React from 'react';
import { Calendar, Tag, Trash2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useTodo } from '../../contexts/TodoContext';

const Row = ({ label, children }) => (
  <div className="mb-4">
    <div className="text-xs font-semibold text-gray-500 mb-1">{label}</div>
    <div>{children}</div>
  </div>
);

const TaskDetails = ({ todo, onClose }) => {
  const { deleteTodo, toggleTodo } = useTodo();
  if (!todo) {
    return (
      <aside className="card">
        <div className="text-sm text-gray-500">Select a task to see details</div>
      </aside>
    );
  }

  return (
    <aside className="card">
      <div className="card-header mb-4">
        <h3 className="card-title">Task</h3>
      </div>

      <Row label="Title">
        <div className="text-lg font-medium">{todo.title}</div>
      </Row>

      {todo.description && (
        <Row label="Description">
          <p className="text-sm text-gray-700">{todo.description}</p>
        </Row>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Row label="List">
          <span className="px-2 py-1 rounded bg-gray-100 text-sm">{todo.category}</span>
        </Row>
        <Row label="Due date">
          {todo.dueDate ? (
            <span className="inline-flex items-center text-sm text-gray-700">
              <Calendar className="w-4 h-4 mr-1" /> {format(new Date(todo.dueDate), 'dd-MM-yy')}
            </span>
          ) : (
            <span className="text-sm text-gray-500">—</span>
          )}
        </Row>
      </div>

      <Row label="Tags">
        <div className="flex flex-wrap gap-2">
          {todo.tags?.length ? (
            todo.tags.map((t, i) => (
              <span key={i} className="inline-flex items-center text-xs px-2 py-1 rounded bg-primary-50">
                <Tag className="w-3 h-3 mr-1" /> {t}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">No tags</span>
          )}
        </div>
      </Row>

      <Row label="Subtasks">
        <button className="text-sm text-gray-500" disabled>
          + Add New Subtask
        </button>
      </Row>

      <div className="flex justify-between mt-6">
        <button onClick={() => deleteTodo(todo._id)} className="btn btn-secondary">
          <Trash2 className="w-4 h-4 mr-2" /> Delete Task
        </button>
        <button onClick={() => toggleTodo(todo._id)} className="btn btn-primary">
          <CheckCircle className="w-4 h-4 mr-2" /> Save changes
        </button>
      </div>
    </aside>
  );
};

export default TaskDetails;
