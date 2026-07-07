/**
 * storage.js — 统一 localStorage 读写封装
 * 所有数据存取必须经过此模块，保证 JSON 序列化/反序列化一致性
 */
const Storage = (() => {
  const PREFIX = 'finapp_';

  /**
   * 读取指定 key 的数据，自动 JSON 反序列化
   * @param {string} key
   * @param {*} fallback - 默认值，key 不存在时返回
   */
  function get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`[Storage] get("${key}") 解析失败，返回默认值`, err);
      return fallback;
    }
  }

  /**
   * 写入数据，自动 JSON 序列化
   * @param {string} key
   * @param {*} value
   */
  function set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (err) {
      console.error(`[Storage] set("${key}") 写入失败`, err);
    }
  }

  /**
   * 删除指定 key
   * @param {string} key
   */
  function remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch (err) {
      console.error(`[Storage] remove("${key}") 删除失败`, err);
    }
  }

  /**
   * 清空本应用所有数据
   */
  function clear() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
  }

  /**
   * 列出本应用所有 key
   */
  function keys() {
    const result = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) result.push(k.slice(PREFIX.length));
    }
    return result;
  }

  return { get, set, remove, clear, keys };
})();