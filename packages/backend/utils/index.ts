export function enhanceResJson(req: any, res: any, next: any) {
  res.json = (obj: any) => {
    res.setHeader('Content-type', 'application/json; charset=utf-8');
    res.writeHead(200);
    res.end(JSON.stringify(obj));
  };
  next();
}
