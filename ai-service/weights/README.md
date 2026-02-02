# Model Weights Storage

This directory is intended to store large model weights (checkpoints) for local AI generation.

## Recommended Structure
- `stable-diffusion/`: Store `.ckpt` or `.safetensors` files here.
- `llm/`: Store quantized LLM models (e.g., GGUF format) here.

## Note
These files are typically large (GBs) and should **NOT** be committed to Git.
Ensure this directory is listed in `.gitignore`.
