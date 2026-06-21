fn server_url() -> String {
    std::env::var("AI_TRANSLATE_SERVER")
        .unwrap_or_else(|_| "http://mini-vivalaakam.local:3001".to_string())
}

#[tauri::command]
async fn rpc_call(body: String) -> Result<String, String> {
    tracing::debug!("rpc_call body={}", &body[..body.len().min(200)]);
    let client = reqwest::Client::new();
    let res = client
        .post(format!("{}/rpc", server_url()))
        .header("Content-Type", "application/json")
        .body(body)
        .send()
        .await
        .map_err(|e| {
            tracing::error!("rpc_call request failed: {e}");
            e.to_string()
        })?;
    let status = res.status();
    tracing::debug!("rpc_call response status={status}");
    res.text().await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn rpc_with_file(
    rpc_json: String,
    file_bytes: Vec<u8>,
    file_name: String,
    mime_type: String,
) -> Result<String, String> {
    tracing::debug!("rpc_with_file name={file_name} size={}", file_bytes.len());
    let client = reqwest::Client::new();
    let part = reqwest::multipart::Part::bytes(file_bytes)
        .file_name(file_name)
        .mime_str(&mime_type)
        .map_err(|e| e.to_string())?;
    let form = reqwest::multipart::Form::new()
        .text("rpc", rpc_json)
        .part("file", part);
    let res = client
        .post(format!("{}/rpc", server_url()))
        .multipart(form)
        .send()
        .await
        .map_err(|e| {
            tracing::error!("rpc_with_file request failed: {e}");
            e.to_string()
        })?;
    let status = res.status();
    tracing::debug!("rpc_with_file response status={status}");
    res.text().await.map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("debug")),
        )
        .init();

    tracing::info!("Starting AI Translate client → {}", server_url());

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![rpc_call, rpc_with_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
