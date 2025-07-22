import React from 'react';

const AccountDetails = () => {
  return (
    <div className="flex-grow bg-black overflow-y-auto">
      {/* Header */}
      <div className="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-[#38383a] bg-black sticky top-0">
        <div className="flex w-full items-center">
          <div className="flex items-center text-3xl text-white">
            <h1 className="text-2xl font-bold">Account Details</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="sm:p-7 p-4">
        <div className="bg-[#1c1c1e] rounded-lg p-8 border border-[#38383a] min-h-[320px] flex items-center justify-center">
          <span className="text-[#ebebf599] text-lg">Account Management Coming Soon</span>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails; 