'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTodo, setEditingTodo] = useState(null);
  const [editText, setEditText] = useState('');
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
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
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setTodos([data[0], ...todos]);
        setNewTodo('');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
      setError(error.message);
    }
  };

  const startEditing = (todo) => {
    setEditingTodo(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = async (id) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ 
          text: editText.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, text: editText.trim(), updated_at: new Date().toISOString() } : todo
      ));
      setEditingTodo(null);
    } catch (error) {
      console.error('Error updating todo:', error.message);
      setError(error.message);
    }
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setEditText('');
  };

  const toggleTodo = async (id) => {
    try {
      const todo = todos.find(t => t.id === id);
      const { error } = await supabase
        .from('todos')
        .update({ 
          completed: !todo.completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed, updated_at: new Date().toISOString() } : todo
      ));
    } catch (error) {
      console.error('Error updating todo:', error.message);
      setError(error.message);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error.message);
      setError(error.message);
    }
  };

  const clearCompleted = async () => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('completed', true)
        .eq('user_id', user.id);

      if (error) throw error;
      setTodos(todos.filter(todo => !todo.completed));
    } catch (error) {
      console.error('Error clearing completed todos:', error.message);
      setError(error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8 relative">
      {/* Sign Out Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSignOut}
        className="absolute top-4 right-4 p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/20"
        title="Sign Out"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-white" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
          />
        </svg>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        {/* Header */}
        <motion.div
          className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 mb-8 shadow-2xl border border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Todo List
          </h1>
          <p className="text-center text-white/60 text-lg">
            Stay organized and boost your productivity
          </p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 backdrop-blur-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Todo Form */}
        <form onSubmit={addTodo} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 text-lg placeholder-white/40 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl hover:from-indigo-600 hover:to-violet-600 transition-all text-lg font-medium shadow-lg shadow-indigo-500/20"
              type="submit"
            >
              Add Task
            </motion.button>
          </div>
        </form>

        {/* Filters */}
        <div className="flex justify-center gap-3 mb-8">
          {['all', 'active', 'completed'].map((filterType) => (
            <motion.button
              key={filterType}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(filterType)}
              className={`px-6 py-3 rounded-xl capitalize text-lg font-medium transition-all ${
                filter === filterType
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {filterType}
            </motion.button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredTodos.map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="group flex flex-col gap-2 p-6 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-6 h-6 rounded-lg border-white/20 bg-white/10 checked:bg-indigo-500 checked:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                  {editingTodo === todo.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-indigo-400"
                        autoFocus
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => saveEdit(todo.id)}
                        className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600"
                      >
                        Save
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  ) : (
                    <>
                      <span
                        className={`flex-1 text-lg ${
                          todo.completed
                            ? 'line-through text-white/40'
                            : 'text-white'
                        }`}
                      >
                        {todo.text}
                      </span>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => startEditing(todo)}
                          className="opacity-0 group-hover:opacity-100 text-blue-400 hover:text-blue-300 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteTodo(todo.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </motion.button>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm text-white/40">
                  <span>Created: {formatDate(todo.created_at)}</span>
                  {todo.updated_at !== todo.created_at && (
                    <span>Updated: {formatDate(todo.updated_at)}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Clear Completed Button */}
        {todos.some(todo => todo.completed) && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={clearCompleted}
            className="mt-8 w-full px-6 py-4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl hover:from-violet-600 hover:to-purple-600 transition-all text-lg font-medium shadow-lg shadow-violet-500/20"
          >
            Clear Completed
          </motion.button>
        )}

        {/* Empty State */}
        {filteredTodos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-white/60"
          >
            <p className="text-xl">No todos found</p>
            <p className="mt-2">Add a new task to get started!</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default TodoList; 