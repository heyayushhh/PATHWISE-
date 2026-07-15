import { db } from "../../db";

import {
  questionPools,
  questions,
  questionOptions,
  questionPoolMapping,
} from "../../db/schemas";

import type { SeedQuestion } from "./assessment.types";


const careerAssessmentQuestions: SeedQuestion[] = [

  {
    questionText:
      "I enjoy solving logical and analytical problems.",
    options: [
      "Strongly Disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly Agree",
    ],
  },

  {
    questionText:
      "I like building things using technology.",
    options: [
      "Strongly Disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly Agree",
    ],
  },

  {
    questionText:
      "I enjoy working with numbers and analysing data.",
    options: [
      "Strongly Disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly Agree",
    ],
  },

  {
    questionText:
      "I like understanding how systems and processes work.",
    options: [
      "Strongly Disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly Agree",
    ],
  },

  {
    questionText:
      "I enjoy creating new ideas and innovative solutions.",
    options: [
      "Strongly Disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly Agree",
    ],
  },

  {
    questionText:
      "I enjoy leading teams and managing people.",
    options: [
      "Strongly Disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly Agree",
    ],
  },

  {
    questionText:
      "I like teaching and explaining concepts to others.",
    options: [
      "Strongly Disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly Agree",
    ],
  },

  {
    questionText:
      "I enjoy research and exploring unknown topics.",
    options: [
      "Strongly Disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly Agree",
    ],
  },

  {
    questionText:
      "I prefer structured problem-solving approaches.",
    options: [
      "Strongly Disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly Agree",
    ],
  },

  {
    questionText:
      "I enjoy designing user experiences and interfaces.",
    options: [
      "Strongly Disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly Agree",
    ],
  },

  {
    questionText:
      "I am interested in business strategy and decision making.",
    options: [
      "Strongly Disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly Agree",
    ],
  },

  {
    questionText:
      "I enjoy experimenting with new technologies.",
    options: [
      "Strongly Disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly Agree",
    ],
  },

  {
    questionText:
      "I like solving social and real-world problems.",
    options: [
      "Strongly Disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly Agree",
    ],
  },

  {
    questionText:
      "I enjoy working independently on challenging tasks.",
    options: [
      "Strongly Disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly Agree",
    ],
  },

  {
    questionText:
      "I enjoy collaboration and communicating with people.",
    options: [
      "Strongly Disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly Agree",
    ],
  },

  {
    questionText:
      "I like improving existing systems and processes.",
    options: [
      "Strongly Disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly Agree",
    ],
  },

  {
    questionText:
      "I like taking calculated risks and exploring opportunities.",
    options: [
      "Strongly Disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly Agree",
    ],
  },

];



async function seedAssessment() {

  console.log("Seeding assessment...");


  const [pool] =
    await db
      .insert(questionPools)
      .values({

        name:
          "Career Interest Assessment",

        description:
          "Assessment to identify user interests and career preferences",

        version:1,

      })
      .returning();



  for(
    let index = 0;
    index < careerAssessmentQuestions.length;
    index++
  ){

    const questionData =
      careerAssessmentQuestions[index];



    const [question] =
      await db
        .insert(questions)
        .values({

          questionText:
            questionData.questionText,

          questionType:
            "MCQ",

          orderNo:
            index + 1,

        })
        .returning();



    await db
      .insert(questionPoolMapping)
      .values({

        poolId:
          pool.id,

        questionId:
          question.id,

      });



    await db
      .insert(questionOptions)
      .values(

        questionData.options.map(
          (option, optionIndex)=>({

            questionId:
              question.id,

            optionText:
              option,

            optionValue:
              optionIndex + 1,

            orderNo:
              optionIndex + 1,

          })
        )

      );

  }


  console.log(
    "Assessment seeded successfully"
  );

}


seedAssessment()
  .then(()=>{

    console.log("Done");
    process.exit(0);

  })
  .catch((error)=>{

    console.error(error);
    process.exit(1);

  });