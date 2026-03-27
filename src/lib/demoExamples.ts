export const DEMO_BEFORE = `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #f5f5f5; padding: 24px; }

  .card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    max-width: 400px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }

  .card-description {
    font-size: 14px;
    color: #666;
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .btn-primary {
    display: inline-block;
    padding: 8px 16px;
    background: #4f46e5;
    color: white;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    border: none;
    cursor: pointer;
  }

  .btn-secondary {
    display: inline-block;
    padding: 8px 16px;
    background: transparent;
    color: #4f46e5;
    border: 1px solid #4f46e5;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    margin-left: 8px;
  }

  .badge {
    display: inline-block;
    padding: 2px 8px;
    background: #e0e7ff;
    color: #3730a3;
    border-radius: 12px;
    font-size: 12px;
    margin-bottom: 12px;
  }
</style>
</head>
<body>
  <div class="card">
    <span class="badge">New</span>
    <h2 class="card-title">Product Update v2.0</h2>
    <p class="card-description">
      We've redesigned the dashboard with improved performance and a cleaner interface. Check out what's new.
    </p>
    <div class="actions">
      <button class="btn-primary">Learn More</button>
      <button class="btn-secondary">Dismiss</button>
    </div>
  </div>
</body>
</html>`

export const DEMO_AFTER = `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #0f172a; padding: 24px; }

  .card {
    background: #1e293b;
    border-radius: 16px;
    padding: 28px;
    max-width: 440px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
    border: 1px solid #334155;
  }

  .card-title {
    font-size: 22px;
    font-weight: 700;
    color: #f1f5f9;
    margin-bottom: 10px;
  }

  .card-description {
    font-size: 15px;
    color: #94a3b8;
    line-height: 1.7;
    margin-bottom: 20px;
  }

  .btn-primary {
    display: inline-block;
    padding: 10px 20px;
    background: #6366f1;
    color: white;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    border: none;
    cursor: pointer;
  }

  .btn-secondary {
    display: inline-block;
    padding: 10px 20px;
    background: transparent;
    color: #94a3b8;
    border: 1px solid #475569;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    margin-left: 10px;
  }

  .badge {
    display: inline-block;
    padding: 4px 10px;
    background: #312e81;
    color: #a5b4fc;
    border-radius: 12px;
    font-size: 12px;
    margin-bottom: 14px;
  }

  .tag-list {
    display: flex;
    gap: 6px;
    margin-bottom: 14px;
  }

  .tag {
    padding: 2px 8px;
    background: #0f172a;
    color: #64748b;
    border-radius: 4px;
    font-size: 11px;
    border: 1px solid #334155;
  }
</style>
</head>
<body>
  <div class="card">
    <span class="badge">New</span>
    <h2 class="card-title">Product Update v3.0</h2>
    <div class="tag-list">
      <span class="tag">Performance</span>
      <span class="tag">UI</span>
    </div>
    <p class="card-description">
      We've completely overhauled the dashboard with a dark-first design, improved performance metrics, and an even cleaner interface.
    </p>
    <div class="actions">
      <button class="btn-primary">Explore Changes</button>
      <button class="btn-secondary">Maybe Later</button>
    </div>
  </div>
</body>
</html>`
