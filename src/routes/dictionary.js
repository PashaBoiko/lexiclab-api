import fs from 'fs';
import express from 'express';
import multer  from 'multer';
import { parse } from 'csv-parse';
import Dictionary from '../models/dictionary.js';
import StatisticManager from '../managers/StatisticManager.js';
import auth from '../middleware/auth.js';
import { failedDefaultResponse, validationErrorsHandler } from '../helpers/index.js';

const router = new express.Router();
const upload = multer({ dest: 'uploads/' });

router.get("/dictionary", auth, async (req, res) => {
  try {
    const data = await Dictionary.findOne({
      userId: req.user._id,
    });

    if (!data) {
      res.status(201).send({});
      return;
    }
    res.status(201).send(data);
  } catch (err) {
   res.status(400).send(failedDefaultResponse(err));
  }
});

router.post('/dictionary', auth, async (req, res) => {
  try {
    let dictionary = await Dictionary.findOne({
      userId: req.user._id,
    });

    if (!dictionary) {
      dictionary = new Dictionary();
      dictionary.userId = req.user._id;
    }

    await dictionary.validate();

    dictionary.dictionary.push({
      ...req.body,
    });

    await dictionary.save();

    await StatisticManager.pushStatistic(req.user._id, {word: 1});

    res.status(201).send(dictionary)
  } catch (err) {
    if (err.name === "ValidationError") {
      res.status(403).send(validationErrorsHandler(err))
      return;
    }
    res.status(500).send(failedDefaultResponse(err));
  }
});

router.put('/dictionary/:id/:itemid', auth, async (req, res) => {
  try {
    const payload = req.body;
    const data = await Dictionary.findOne({ _id: req.params.id });

    if (!data) {
      return res.status(400).send(failedDefaultResponse("The item was not found"));
    }

    const index = data.dictionary.findIndex((item) => {
      return item._id.equals(req.params.itemid);
    });

    if (index !== -1) {
      const updatedItem = data.dictionary[index];
      if (typeof payload.en === "string") updatedItem.en = payload.en;
      if (typeof payload.ua === "string") updatedItem.ua = payload.ua;
      if (typeof payload.description === "string") updatedItem.description = payload.description;
      if (typeof payload.iteration === "number") updatedItem.iteration = payload.iteration;
    }
    await data.save();
    res.send(data)
  } catch (err) {
    res.status(500).send(failedDefaultResponse(err));
  }
});

router.get('/dictionary/refresh/:id/:itemid', auth, async (req, res) => {
  try {
    const data = await Dictionary.findOne({ _id: req.params.id });

    if (!data) {
      return res.status(400).send(failedDefaultResponse("The item was not found"));
    }

    const index = data.dictionary.findIndex((item) => {
      return item._id.equals(req.params.itemid);
    });

    if (index !== -1) {
      const updatedItem = data.dictionary[index];
      updatedItem.iteration = 0;
    }
    await data.save();
    res.send(data)
  } catch (err) {
    res.status(500).send(failedDefaultResponse(err));
  }
});

router.delete('/dictionary/:id/:itemid', auth, async (req, res) => {
  try {
    const data = await Dictionary.findOne({ _id: req.params.id });

    if (!data) {
      return res.status(400).send(failedDefaultResponse("The item was not found"));
    }

    const index = data.dictionary.findIndex((item) => {
      return item._id.equals(req.params.itemid);
    });
    if (index !== -1) data.dictionary.splice(index, 1);

    await data.save();
    res.send(data)
  } catch (err) {
    res.status(500).send(failedDefaultResponse(err));
  }
});

router.post('/dictionary/import', auth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    const validateFormat = (row) => {
      return row[0] === "en" && row[1] === "ua" && row[2] === "description";
    }

    if (!file) throw Error('The file is not defined');

    let dictionary = await Dictionary.findOne({
      userId: req.user._id,
    });

    if (!dictionary) {
      dictionary = new Dictionary();
      dictionary.userId = req.user._id;
    }

    const records = [];

    if (file.mimetype !== "text/csv") throw Error('The file should have csv format');

    fs.createReadStream(file.path)
      .pipe(parse({delimiter: ','}))
      .on('data', (row) => {
        records.push(row);
      })
      .on('end',async ()=> {
        //do something with csvData

        if (!validateFormat(records[0])) throw Error('Format is not valid');

        records.forEach((item, index) => {
          if (index === 0) return;

          dictionary.dictionary.push({
            en: item[0],
            ua: item[1],
            description: item[2],
          });
        });

        await StatisticManager.pushStatistic(req.user._id, {
          word: records.length,
        });

        await dictionary.save();

        res.status(201).send(dictionary)
      });
  } catch (err) {
    res.status(400).send(failedDefaultResponse(err));
  }
});


export default router;
