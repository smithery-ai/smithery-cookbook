import { Request, Response, NextFunction } from "express";

export function logging(req: Request, res: Response, next: NextFunction) {
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`[${timestamp}] Body:`, req.body);
  }
  
  res.on('finish', () => {
    console.log(`[${timestamp}] Response: ${res.statusCode}`);
  });
  
  next();
}
