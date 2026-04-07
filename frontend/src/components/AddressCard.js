import React from 'react';

const AddressCard = ({ address, onEdit, onDelete, onSetDefault, isDefault }) => {
  return (
    <div className={`relative flex flex-col gap-4 rounded-2xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg sm:p-6 ${isDefault ? 'border-rose-400 bg-rose-50/60 shadow-sm' : 'border-slate-200'}`}>
      {isDefault && (
        <div className="absolute -top-3 left-4 rounded-full bg-rose-500 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-white shadow-sm">
          Default Address
        </div>
      )}

      <div className="pt-2">
        <h3 className="mb-3 text-lg font-semibold text-slate-900">
          {address.first_name} {address.last_name}
        </h3>

        <div className="space-y-1.5">
          <p className="text-sm leading-6 text-slate-600">{address.street_address}</p>
          <p className="text-sm leading-6 text-slate-600">
            {address.city}, {address.state} {address.zip_code}
          </p>
          <p className="text-sm leading-6 text-slate-600">{address.country}</p>
        </div>

        <div className="mt-4 space-y-1 border-t border-slate-200 pt-4 text-sm text-slate-500">
          <p><span className="font-semibold text-slate-700">Phone:</span> {address.phone}</p>
          <p><span className="font-semibold text-slate-700">Email:</span> {address.email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:flex-wrap sm:justify-end">
        {!isDefault && (
          <button 
            className="rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-500 hover:bg-rose-500 hover:text-white"
            onClick={onSetDefault}
            title="Set as default address"
          >
            Set Default
          </button>
        )}
        <button 
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 hover:shadow-md"
          onClick={onEdit}
          title="Edit this address"
        >
          Edit
        </button>
        <button 
          className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-500 hover:bg-rose-500 hover:text-white"
          onClick={onDelete}
          title="Delete this address"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default AddressCard;
