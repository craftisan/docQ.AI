export interface QAResponse {
  question: string | undefined;
  answer: string | undefined;
  sources: string[] | undefined;
  error: string | undefined;
  status: boolean;
}