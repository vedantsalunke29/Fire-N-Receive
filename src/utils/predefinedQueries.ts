export const predefinedQueries = [
    {
      name: "Employee List",
      query: "SELECT * FROM employees WHERE department = 'Engineering' ORDER BY last_name ASC;",
    },
    {
      name: "Sales By Region",
      query: "SELECT region, SUM(amount) as total_sales FROM sales GROUP BY region ORDER BY total_sales DESC;",
    },
    {
      name: "Product Inventory",
      query: "SELECT product_name, category, quantity, price FROM products WHERE quantity < 100 ORDER BY quantity ASC;",
    },
    {
      name: "Customer Orders",
      query:
        "SELECT c.name, c.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.id ORDER BY total_spent DESC LIMIT 10;",
    },
    {
      name: "Top 10 Products",
      query:
        "SELECT p.product_name, p.category, SUM(o.quantity) as units_sold FROM products p JOIN order_items o ON p.id = o.product_id GROUP BY p.id ORDER BY units_sold DESC LIMIT 10;",
    },
  ]
  
  