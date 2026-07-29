export interface LetterInput {
  recipient: string;
  senderName: string;
  letterContent: string;
  senderEmail: string;
}

export interface PlanResult {
  keyTopics: string[];
  leadTopic: string;
  emotionFlow: string[];
  structureNote: string;
}
