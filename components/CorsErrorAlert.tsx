import React from 'react';
import { InfoCircleIcon } from './icons/InfoCircleIcon';
import { XIcon } from './icons/XIcon';

interface CorsErrorAlertProps {
    onDismiss: () => void;
    context?: 'start' | 'upload' | 'checker' | 'systemInput';
}

const BaseInstructions = () => (
    <>
        <p className="font-semibold mt-3">How to fix this in n8n:</p>
        <ol className="list-decimal list-inside space-y-2 mt-1">
            <li>Select the problematic node in your n8n workflow.</li>
            <li>In its parameters, scroll to the <strong>Options</strong> section.</li>
            <li>Click <strong>Add Response Header</strong>. If you don't see this button, you may need to add the "Response Headers" option first.</li>
            <li>Set the <strong>Name</strong> to <code className="font-mono bg-blue-100 text-blue-900 px-1 py-0.5 rounded">Access-Control-Allow-Origin</code> and the <strong>Value</strong> to <code className="font-mono bg-blue-100 text-blue-900 px-1 py-0.5 rounded">*</code>.</li>
        </ol>
    </>
);

const StartError = () => (
    <>
        <p>The application could not start the workflow. This is often a Cross-Origin Resource Sharing (CORS) issue.</p>
        <BaseInstructions />
        <p className="mt-3 font-bold">Please apply this fix to the initial <code className="font-mono bg-blue-100 text-blue-900 px-1 py-0.5 rounded">Webhook</code> trigger node in your workflow.</p>
        <p className="mt-3">After activating the workflow with this change, please try starting the workflow again.</p>
    </>
);

const UploadError = () => (
    <>
        <p>The application could not upload the file to the **Maker Agent**. This is likely a CORS issue.</p>
        <BaseInstructions />
        <p className="mt-3 font-bold">The error is most likely in the <code className="font-mono bg-blue-100 text-blue-900 px-1 py-0.5 rounded">Wait</code> node that receives the uploaded file for the Maker Agent.</p>
        <p className="mt-3">After activating the workflow with this change, please start over and try uploading your document again.</p>
    </>
);

const CheckerError = () => (
    <>
        <p>The app successfully activated the **Checker Agent**, but failed to send it the extracted data. This is a classic Cross-Origin Resource Sharing (CORS) issue.</p>
        <div className="mt-3 p-3 bg-blue-100 rounded-md border border-blue-200">
            <p className="font-semibold text-blue-800">Why does this happen here?</p>
            <p className="mt-1 text-blue-700">Sending JSON data (with <code className="font-mono text-xs">Content-Type: application/json</code>) causes the browser to send a special "preflight" request for permission first. The initial file upload does not trigger this check. The error means your n8n node didn't grant permission.</p>
        </div>
        <BaseInstructions />
        <p className="mt-3 font-bold">Please apply this fix to the <code className="font-mono bg-blue-100 text-blue-900 px-1 py-0.5 rounded">Wait</code> node for your Checker Agent.</p>
    </>
);

const SystemInputError = () => (
    <>
        <p>The app successfully activated the **System Input Agent**, but failed to send it the data. This is a classic Cross-Origin Resource Sharing (CORS) issue.</p>
        <div className="mt-3 p-3 bg-blue-100 rounded-md border border-blue-200">
            <p className="font-semibold text-blue-800">Why does this happen here?</p>
            <p className="mt-1 text-blue-700">Sending JSON data (with <code className="font-mono text-xs">Content-Type: application/json</code>) causes the browser to send a special "preflight" request for permission first. The initial file upload does not trigger this check. The error means your n8n node didn't grant permission.</p>
        </div>
        <BaseInstructions />
        <p className="mt-3 font-bold">Please apply this fix to the <code className="font-mono bg-blue-100 text-blue-900 px-1 py-0.5 rounded">Wait</code> node for your System Input Agent.</p>
    </>
);


const GenericError = () => (
    <>
      <p>The application could not connect to your n8n workflow. This is typically a Cross-Origin Resource Sharing (CORS) issue.</p>
      <BaseInstructions />
      <p className="mt-3 font-bold">Important: You must repeat these steps for <span className="underline">every</span> node that acts as a webhook (e.g., the initial Trigger and any 'Wait' nodes).</p>
    </>
);


export const CorsErrorAlert: React.FC<CorsErrorAlertProps> = ({ onDismiss, context }) => {
    
    const getContent = () => {
        switch (context) {
            case 'start':
                return <StartError />;
            case 'upload':
                return <UploadError />;
            case 'checker':
                return <CheckerError />;
            case 'systemInput':
                return <SystemInputError />;
            default:
                return <GenericError />;
        }
    };

    return (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md shadow-md mb-6 animate-fade-in">
          <div className="flex">
            <div className="flex-shrink-0">
              <InfoCircleIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-base font-medium text-blue-800">Workflow Connection Help</h3>
              <div className="mt-2 text-sm text-blue-700">
                {getContent()}
              </div>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={onDismiss}
                  type="button"
                  className="inline-flex bg-blue-50 rounded-md p-1.5 text-blue-500 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-50 focus:ring-blue-600"
                  aria-label="Dismiss"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
    );
};