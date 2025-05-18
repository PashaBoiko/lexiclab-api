import Statistic from '../models/statistic.js';

const validateStatisticInput = (value) => {
  return typeof value === "number" && value >= 0;
}

class StatisticManager {

  constructor() {}

  async #initStatisticEntity(user_id) {
    try {
      const statistic = new Statistic();
      statistic.userId = user_id;
      statistic.statistics = [];

      await statistic.save();

      return statistic
    } catch (err) {
      throw err;
    }
  }

  async find(user_id) {
    try {
      if (!user_id) throw Error('[Statistic Manager]: The user_id is not define');

      let statistic = await Statistic.findOne({
        userId: user_id,
      });
      if (!statistic) statistic = this.#initStatisticEntity(user_id);
      return statistic;
    } catch (err) {
      throw err;
    }
  }

  async pushStatistic(user_id, data) {
    const statistic = await this.find(user_id);

    const {
      word = 0,
      quiz_completed = 0,
      repeat_completed = 0,
    } = data;

    Object.keys(data).forEach((key) => {
      if(!validateStatisticInput(data[key]))
        throw Error(`[Statistic Manager]: invalid payload, ${key} should be a number more or equals 0`)
    })

    const statisticRow = statistic.statistics.find((item) => {
      const now = new Date();
      const rowDate = item.date;
      return rowDate.getDate() === now.getDate()
          && rowDate.getMonth() === now.getMonth()
          && rowDate.getFullYear() === now.getFullYear();
    });

    if (!statisticRow) {
      statistic.statistics.push({
        word,
        quiz_completed,
        repeat_completed,
        date: new Date(),
      });
    } else {
      statisticRow.word += word;
      statisticRow.quiz_completed += quiz_completed;
      statisticRow.repeat_completed += repeat_completed;
    }

    return await statistic.save();
  }
}

export default new StatisticManager();