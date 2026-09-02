const fs = require('fs');
const path = require('path');

const dir = 'backend/src/routes/campaigns';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts')).map(f => path.join(dir, f));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/const \{ orgId, customerId, \.\.\.payload \} = req\.body;/g, 'const { customerId, ...payload } = req.body;\n    const orgId = (req.headers[\"x-organization-id\"] || req.query.orgId || req.body.orgId || \"demo-org-123\") as string;');
  content = content.replace(/orgId \|\| \"default\"/g, 'orgId');
  fs.writeFileSync(f, content);
});
console.log('Done!');
