from langchain.prompts import PromptTemplate

map_prompt = PromptTemplate(
    input_variables=["context", "question"],
    template="""
You are a helpful assistant. Given the following CONTEXT and QUESTION,
either answer the question purely from the context or say "NOT IN CONTEXT"
if the answer isn’t found here.

CONTEXT:
{context}

QUESTION:
{question}

Answer in one or two sentences:
""".strip(),
)

combine_prompt = PromptTemplate(
    input_variables=["summaries", "question"],
    template="""
You have these answers from different parts of the document:

{summaries}

Using only this information, produce a final, concise answer to:
"{question}"

If any part is contradictory, reconcile them. If none contain the answer, reply "I don't know."
""".strip(),
)
