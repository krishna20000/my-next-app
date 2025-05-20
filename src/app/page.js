'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!newTodo.trim()) {
      setError('Todo text cannot be empty');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([
          { 
            text: newTodo.trim(),
            completed: false,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (data && data.length > 0) {
        setTodos([data[0], ...todos]);
        setNewTodo('');
      } else {
        throw new Error('No data returned from insert');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
      setError(error.message);
    }
  };

  const toggleTodo = async (id) => {
    try {
      const todo = todos.find(t => t.id === id);
      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    } catch (error) {
      console.error('Error updating todo:', error.message);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error.message);
    }
  };

  const clearCompleted = async () => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('completed', true);

      if (error) throw error;
      setTodos(todos.filter(todo => !todo.completed));
    } catch (error) {
      console.error('Error clearing completed todos:', error.message);
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 md:p-8 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <motion.div
          className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-8 shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Todo List
          </h1>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200"
          >
            {error}
          </motion.div>
        )}

        {/* Add Todo Form */}
        <form onSubmit={addTodo} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new todo..."
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-indigo-400"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors"
              type="submit"
            >
              Add
            </motion.button>
          </div>
        </form>

        {/* Filters */}
        <div className="flex justify-center gap-4 mb-6">
          {['all', 'active', 'completed'].map((filterType) => (
            <motion.button
              key={filterType}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === filterType
                  ? 'bg-indigo-500'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {filterType}
            </motion.button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTodos.map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-4 bg-white/10 rounded-lg backdrop-blur-sm"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="w-5 h-5 rounded border-white/20 bg-white/10"
                />
                <span
                  className={`flex-1 ${
                    todo.completed
                      ? 'line-through text-white/50'
                      : 'text-white'
                  }`}
                >
                  {todo.text}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Clear Completed Button */}
        {todos.some(todo => todo.completed) && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearCompleted}
            className="mt-6 w-full px-6 py-2 bg-violet-500 rounded-lg hover:bg-violet-600 transition-colors"
          >
            Clear Completed
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default TodoList;