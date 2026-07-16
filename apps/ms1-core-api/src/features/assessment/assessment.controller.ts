import type { Response } from "express";

import {
  startAssessment,
  getAssessmentQuestions,
  saveAssessmentAnswer,
  completeStaticAssessment,
} from "./assessment.service";

import type { AuthenticatedRequest } from "../authentication/types";



export async function startAssessmentController(
  req: AuthenticatedRequest,
  res: Response
) {

  try {


    const userId =
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }



    const {
      assessmentType
    } = req.body;



    const session =
      await startAssessment(
        userId,
        assessmentType
      );



    return res.status(201)
      .json({

        message:
          "Assessment started",

        sessionId:
          session.id

      });



  }
  catch(error) {


    console.error(error);


    return res.status(500)
      .json({

        message:
          "Failed to start assessment"

      });


  }

}









export async function getQuestionsController(
  req: AuthenticatedRequest,
  res: Response
) {

  try {


    const questions =
      await getAssessmentQuestions();



    return res.status(200)
      .json({

        questions

      });



  }
  catch(error) {


    console.error(error);



    return res.status(500)
      .json({

        message:
          "Failed to fetch questions"

      });


  }

}









export async function submitAnswerController(
  req: AuthenticatedRequest,
  res: Response
) {

  try {


    const {
      questionId,
      selectedOptionId

    } = req.body;



    const response =
      await saveAssessmentAnswer(

        Array.isArray(req.params.sessionId)
          ? req.params.sessionId[0]
          : req.params.sessionId,

        questionId,

        selectedOptionId

      );



    return res.status(201)
      .json({

        message:
          "Answer saved",

        response

      });



  }
  catch(error) {


    console.error(error);



    return res.status(500)
      .json({

        message:
          "Failed to save answer"

      });


  }

}

export async function completeStaticAssessmentController(
  req: AuthenticatedRequest,
  res: Response
) {

  try {


    const sessionId =
      req.params.id;



    const result =
      await completeStaticAssessment(
        Array.isArray(req.params.id)
          ? req.params.id[0]
          : req.params.id
      );



    return res.status(200)
      .json({

        message:
          "Assessment completed",

        data:
          result

      });



  }
  catch(error) {


    console.error(error);



    return res.status(500)
      .json({

        message:
          "Failed to complete assessment"

      });


  }

}