from embedchain.chunkers.web_page import WebPageChunker
from embedchain.data_formatter import DataFormatter
from embedchain.config import AddConfig
from embedchain.utils.misc import detect_datatype
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import TiDBVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
from dotenv import load_dotenv
import os
import torch

load_dotenv()

class Load:
    def __init__(self, source, vector_store_path, batch_size=32, max_length=128):
        self.src = source
        self.add_config = AddConfig()
        self.vector_store_path = vector_store_path
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.batch_size = batch_size
        self.max_length = max_length

        os.environ['OPENAI_API_KEY'] = os.getenv('OPENAI_API_KEY')

    def _info_load(self):
        return {'device': self.device, 'batch_size': self.batch_size, 'max_length': self.max_length}

    def detect_DATATYPE(self):
        return detect_datatype(self.src)

    def loader_and_chunker_by_datatype(self, data_type, config):
        data_formatter = DataFormatter(data_type, config)
        return data_formatter.loader, data_formatter.chunker

    def _get_data(self):
        DT = self.detect_DATATYPE()
        loader, chunker = self.loader_and_chunker_by_datatype(data_type=DT, config=self.add_config)
        return chunker.create_chunks(loader=loader, src=self.src, config=self.add_config.chunker)

    def _prepare_for_embeddings(self):
        data = self._get_data()
        return data['documents'], data['metadatas'], data['ids'], data['doc_id']

class Embedder:
    def __init__(self, source, vector_store_path, tidb_connection_string):
        self.src = source
        self.vector_path = vector_store_path
        self.wrapper = None
        self.tidb_connection_string = tidb_connection_string
        self.vector_store = TiDBVectorStore(connection_string=self.tidb_connection_string, table_name="embedded_documents")
        self.utils = None

    def embedding_function(self, texts):
        embeddings = []
        embeddings_model = OpenAIEmbeddings()  # Use OpenAI embeddings
        for text in texts:
            embedding = embeddings_model.embed(text)  # Generate embedding for each text
            embeddings.append(embedding)
        return embeddings

    def embed_data(self):
        docs, meta, ids, doc_ids = self.wrapper._prepare_for_embeddings()
        embeddings = self.embedding_function(docs)  # Get embeddings for the documents
        self.vector_store.add(
            documents=docs,
            embeddings=embeddings,
            metadata=[{"source": src} for src in meta]
        )
        return