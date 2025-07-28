from langchain_core.prompts import PromptTemplate
from langchain.chains.llm import LLMChain
from langchain.chains.combine_documents.stuff import StuffDocumentsChain
from langchain.chains.combine_documents.reduce import ReduceDocumentsChain
from langchain.chains.combine_documents.map_reduce import MapReduceDocumentsChain
from langchain.chains import RetrievalQA


from app.services.prompts import map_prompt, combine_prompt

def make_qa_chain(llm, retriever):
    """
    1) Map each chunk with map_prompt - LLMChain
    2) Reduce the map‑outputs via combine_prompt - another LLMChain wrapped
       in a StuffDocumentsChain then ReduceDocumentsChain
    3) Wire them together in MapReduceDocumentsChain
    4) Plug into RetrievalQA
    """

    # 1. Map step: run map_prompt over each Document
    # map_prompt.input_variables == ["context","question"]
    map_chain = LLMChain(llm=llm, prompt=map_prompt)

    # 2a. Prepare a tiny PromptTemplate to extract each page_content for the reduce combiner
    document_prompt = PromptTemplate(
        input_variables=["page_content"],
        template="{page_content}"
    )

    # 2b. Combine step LLMChain
    # combine_prompt.input_variables == ["summaries","question"]
    reduce_llm_chain = LLMChain(llm=llm, prompt=combine_prompt)

    # 2c. Wrap that in a StuffDocumentsChain to take the list of map-summaries
    combine_documents_chain = StuffDocumentsChain(
        llm_chain=reduce_llm_chain,
        document_prompt=document_prompt,
        # this name must match combine_prompt’s first input ("summaries")
        document_variable_name="summaries",
    )

    # 2d. If you expect many summaries you can collapse them first;
    # here we just pass them straight through a single level:
    reduce_documents_chain = ReduceDocumentsChain(
        combine_documents_chain=combine_documents_chain
    )

    # 3. Map‑Reduce chain
    map_reduce_chain = MapReduceDocumentsChain(
        llm_chain=map_chain,
        reduce_documents_chain=reduce_documents_chain,
        # this name must match map_prompt’s first input ("context")
        document_variable_name="context",
    )

    # 4. Finally, hook into RetrievalQA
    qa = RetrievalQA(
        retriever=retriever,
        combine_documents_chain=map_reduce_chain,
        return_source_documents=True,
    )

    return qa
