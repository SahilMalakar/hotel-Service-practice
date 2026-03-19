import { NextFunction, Request, Response } from "express";
import { isAppError } from "../utils/errors/app.error";

export const appErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (isAppError(err)) {
    console.log("AppError:", err);

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
};


export const genericErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("Generic Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
