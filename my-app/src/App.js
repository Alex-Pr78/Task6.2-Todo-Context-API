import { useState } from 'react';
import { useTodos } from './hooks/useTodos';
import { ControlPanel, TodoListComponent } from './components';
import { API_URL } from './utils/api-url';
import styles from './App.module.css';

export const App = () => {
	const { todos, setTodos, loading, error, setError } = useTodos();

	const [newTodoText, setNewTodoText] = useState('');
	const [searchText, setSearchText] = useState('');
	const [sortAlpha, setSortAlpha] = useState(false);

	// Добавление новой задачи
	const addTodo = () => {
		const trimmedText = newTodoText.trim();
		if (!trimmedText) return;

		const newTodo = {
			title: trimmedText,
			completed: false,
		};
		fetch(API_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(newTodo),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error('Ошибка при добавлении');
				}
				return response.json();
			})
			.then((createdTodo) => {
				setNewTodoText('');
				// Добавляем в локальное состояние
				setTodos((prevTodos) => [...prevTodos, createdTodo]);
			})
			.catch((error) => setError(error.message));
	};

	// Удаление задачи
	const deleteTodo = (id) => {
		fetch(`${API_URL}/${id}`, {
			method: 'DELETE',
		})
			.then((response) => {
				if (!response.ok) throw new Error('Ошибка при удалении');
				// Удаляем из локального состояния
				setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
			})
			.catch((error) => setError(error.message));
	};

	// Обновление completed
	const toggleCompleted = (todo) => {
		fetch(`${API_URL}/${todo.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ completed: !todo.completed }),
		})
			.then((res) => {
				if (!res.ok) throw new Error('Ошибка при обновлении');
				setTodos((prevTodos) =>
					prevTodos.map((t) =>
						t.id === todo.id ? { ...t, completed: !t.completed } : t,
					),
				);
			})
			.catch((err) => setError(err.message));
	};

	// Фильтрация по поиску
	const filteredTodos = todos.filter((todo) =>
		todo.title.toLowerCase().includes(searchText.toLowerCase()),
	);

	// Сортировка по алфавиту
	const displayedTodos = sortAlpha
		? [...filteredTodos].sort((a, b) => a.title.localeCompare(b.title))
		: filteredTodos;

	return (
		<div className={styles.container}>
			<ControlPanel
				newTodoText={newTodoText}
				setNewTodoText={setNewTodoText}
				addTodo={addTodo}
				searchText={searchText}
				setSearchText={setSearchText}
				setSortAlpha={setSortAlpha}
			/>

			{loading && <p>Loading...</p>}
			{error && <p className={styles.error}>{error}</p>}

			{!loading && !error && (
				<TodoListComponent
					displayedTodos={displayedTodos}
					toggleCompleted={toggleCompleted}
					deleteTodo={deleteTodo}
				/>
			)}
		</div>
	);
};
