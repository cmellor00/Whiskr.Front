import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { API } from "../api/apiContext";
import { useAuth } from "../auth/AuthContext";
import { Html5QrcodeSupportedFormats } from "html5-qrcode";

const config = {
    fps: 10,
    qrbox: 250,
    formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128
    ]
};


function BarcodeScanner() {
    const [scannerVisible, setScannerVisible] = useState(false);
    const [scannedData, setScannedData] = useState(null);
    const [productInfo, setProductInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { token } = useAuth();

    const scannerRef = useRef(null);
    const qrCodeInstance = useRef(null);
    const isRunning = useRef(false);

    const toggleScanner = () => {
        setScannerVisible(prev => !prev);
    };

    useEffect(() => {
        let isMounted = true;

        const initScanner = async () => {
            if (!scannerRef.current) return;

            try {
                qrCodeInstance.current = new Html5Qrcode(scannerRef.current.id);
                const devices = await Html5Qrcode.getCameras();

                if (devices.length > 0 && isMounted) {
                    isRunning.current = true;
                    await qrCodeInstance.current.start(
                        { facingMode: "environment" },
                        config,
                        async (decodedText) => {
                            console.log("✅ Barcode detected:", decodedText);
                            if (!isRunning.current) return;

                            try {
                                await qrCodeInstance.current.stop();
                                await qrCodeInstance.current.clear();
                                isRunning.current = false;
                                setScannedData(decodedText);
                                setScannerVisible(false);
                                fetchProductInfo(decodedText);
                            } catch (err) {
                                console.warn("Stop failed:", err);
                            }
                        },
                        (err) => console.warn("QR scan error:", err)
                    );


                }
            } catch (err) {
                console.error("Scanner init error:", err);
                setError("Failed to start scanner.");
            }
        };

        if (scannerVisible) {
            setTimeout(initScanner, 100); // Slight delay to ensure DOM renders
        }

        return () => {
            isMounted = false;
            if (qrCodeInstance.current && isRunning.current) {
                qrCodeInstance.current
                    .stop()
                    .then(() => qrCodeInstance.current.clear())
                    .catch((err) => console.warn("Stop/clear error:", err));
                isRunning.current = false;
            }
        };
    }, [scannerVisible]);

    const fetchProductInfo = async (barcode) => {
        setLoading(true);
        try {
            const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
            const data = await res.json();
            if (data.status === 1) {
                setProductInfo({
                    name: data.product.product_name || "Unnamed Product",
                    quantity: data.product.quantity || "1",
                    unit: data.product.unit || "pcs",
                });
            } else {
                setError("Product not found.");
            }
        } catch {
            setError("Error fetching product.");
        }
        setLoading(false);
    };

    const handleAddToPantry = async () => {
        if (!productInfo || !token) return;
        try {
            const res = await fetch(`${API}/pantry`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(productInfo),
            });
            if (!res.ok) throw new Error();
            alert("Added to pantry!");
            setProductInfo(null);
            setScannedData(null);
        } catch {
            setError("Failed to add item.");
        }
    };

    return (
        <div className="scanner-wrapper">
            <button onClick={toggleScanner}>
                {scannerVisible ? "Close Scanner" : "Scan a Barcode"}
            </button>

            {scannerVisible && (
                <div style={{ marginTop: "1em" }}>
                    <div
                        id="scanner"
                        ref={scannerRef}
                        style={{ width: "300px", height: "300px", marginBottom: "1em" }}
                    ></div>
                    {loading && <p>Loading product info...</p>}
                    {error && <p style={{ color: "red" }}>{error}</p>}
                </div>
            )}

            {productInfo && (
                <div className="product-preview">
                    <strong>{productInfo.name}</strong>
                    <p>{productInfo.quantity} {productInfo.unit}</p>
                    <button onClick={handleAddToPantry}>Add to Pantry</button>
                </div>
            )}
        </div>
    );
}

export default BarcodeScanner;
