if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/practice-planner/service-worker.js', { scope: '/practice-planner/' });
  });
}
