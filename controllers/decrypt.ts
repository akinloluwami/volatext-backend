import { Request, Response } from "express";
import prisma from "../prisma/prisma";
import cryptr from "../utils/cryptr";

export default async function decrypt(req: Request, res: Response) {
  try {
    const { code, password } = req.query;
    if (!code || !password) {
      return res.status(400).json({
        message: "Sharing code and password are required",
      });
    }
    const text = await prisma.text.findUnique({
      where: {
        sharing_code: code.toString(),
      },
    });
    if (!text) {
      return res.status(400).json({
        message: "Invalid decryption payload",
      });
    }
    const isPasswordCorrect = password.toString() === cryptr.decrypt(text.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid decryption payload",
      });
    }

    if (text.self_destruct) {
      await prisma.text.delete({
        where: { sharing_code: code.toString() },
      });
    }
    return res.status(200).json({
      text: cryptr.decrypt(text.text),
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Something went wrong" });
  }
}
