import { Router } from "express";


import {
 startAssessmentController,
 getQuestionsController,
 submitAnswerController
}
from "./assessment.controller";

import {
  completeStaticAssessmentController
}
from "./assessment.controller";

import {
  startDynamicAssessmentController,
  getDynamicAssessmentResultController,
  submitDynamicAnswerController,
  getDynamicAssessmentStatusController,
  setTargetRecommendationController,
} from "./assessment.dynamic.controller";

const router =
Router();



router.get(
  "/dynamic/:sessionId",
  getDynamicAssessmentStatusController
);



router.post(
"/start",
startAssessmentController
);



router.get(
"/:sessionId/questions",
getQuestionsController
);



router.post(
"/:sessionId/answer",
submitAnswerController
);

router.post(
  "/:id/complete-static",
  completeStaticAssessmentController
);

router.post(
  "/dynamic/start",
  startDynamicAssessmentController
);

router.post(
  "/dynamic/:sessionId/answer",
  submitDynamicAnswerController
);

router.get(
  "/dynamic/:sessionId/result",
  getDynamicAssessmentResultController
);

router.post(
  "/dynamic/:sessionId/target",
  setTargetRecommendationController
);

export default router;
