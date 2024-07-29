import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";

const app = express();
const port = 3000;

app.use(bodyParser.json());

const files = ["A.json", "B.json", "C.json", "D.json"];

// Function to initialize JSON files if they don't exist
const initializeFiles = () => {
  files.forEach((file) => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]), "utf8");
    }
  });
};

// Function to save number to the appropriate JSON file
const saveNumberToFile = (file: string, number: number) => {
  const filePath = path.join(__dirname, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  data.push(number);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};

// Function to check if all files have at least one number
const allFilesHaveNumbers = () => {
  const allData: Record<string, Array<number>> = {};
  files.forEach((file) => {
    const data = JSON.parse(
      fs.readFileSync(path.join(__dirname, file), "utf8")
    );
    allData[file.split(".")[0]] = data;
  });
  const filesHaveNumber = files.every((file) => {
    return allData[file.split(".")[0]].length > 0;
  });

  return { allData, filesHaveNumber };
};

// Endpoint to handle number input
app.post("/input-number", (req: Request, res: Response) => {
  const number: number = req.body.number;

  if (number < 1 || number > 25) {
    return res.status(400).send("Number must be between 1 and 25");
  }

  const { filesHaveNumber } = allFilesHaveNumbers();

  if (filesHaveNumber) {
    return res
      .status(200)
      .send("Process Already completed. You can not add more numbers.");
  }

  const result = number * 7;

  if (result > 140) {
    saveNumberToFile("A.json", number);
  } else if (result > 100) {
    saveNumberToFile("B.json", number);
  } else if (result > 60) {
    saveNumberToFile("C.json", number);
  } else {
    saveNumberToFile("D.json", number);
  }

  const { filesHaveNumber: processCompleted } = allFilesHaveNumbers();

  if (processCompleted) {
    return res
      .status(200)
      .send("Process complete. All files have at least one number.");
  }

  res.status(200).send("Number processed and stored.");
});

// Endpoint to list all numbers
app.get("/list-numbers", (req: Request, res: Response) => {
  const { filesHaveNumber, allData } = allFilesHaveNumbers();
  if (!filesHaveNumber) {
    return res.status(400).send("Not all files have numbers.");
  }
  res.status(200).json(allData);
});

app.listen(port, () => {
  initializeFiles();
  console.log(`Server running at http://localhost:${port}`);
});
