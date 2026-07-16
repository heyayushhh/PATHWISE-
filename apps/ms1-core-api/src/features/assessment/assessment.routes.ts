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

const router =
Router();



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

export default router;