import { z } from "zod";


export const startAssessmentSchema = z.object({

  assessmentType:
    z.string()
      .min(1)

});


export const submitAnswerSchema = z.object({

  questionId:
    z.string()
      .uuid(),

  selectedOptionId:
    z.string()
      .uuid()

});