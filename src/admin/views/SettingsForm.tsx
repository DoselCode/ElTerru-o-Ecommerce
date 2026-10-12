import React from 'react';
import {
  FloppyDisk, CircleNotch, Storefront, Phone, Envelope, MapPin, Clock, Layout, Info, UploadSimple,
  Image as ImageIcon, WhatsappLogo, InstagramLogo,
} from '@phosphor-icons/react';
import { DayHoursEditor } from '../settings/DayHoursEditor';
import {
  useStoreSettings, ImageField, StoreSettingsData,
} from '../hooks/useStoreSettings';

type TextKey = {
  [K in keyof StoreSettingsData]: StoreSettingsData[K] extends string ? K : never;
}[keyof StoreSettingsData];
type FlagKey = {
  [K in keyof StoreSettingsData]: StoreSettingsData[K] extends boolean ? K : never;
}[keyof StoreSettingsData];

const INPUT_CLASS = 'w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg';
const CARD_CLASS = 'bg-white rounded-2xl shadow-sm border border-terruno-border p-6 md:p-8 space-y-6';

const Card: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className={CARD_CLASS}>
    <div className="flex items-center gap-2 text-terruno-burgundy border-b border-terruno-border pb-4">
      {icon}
      <h2 className="text-lg font-medium text-terruno-brown">{title}</h2>
    </div>
    {children}
  </div>
);

interface TextFieldProps {
  label: string;
  name: TextKey;
  value: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  rows?: number;
  type?: string;
  placeholder?: string;
}

const TextField: React.FC<TextFieldProps> = ({ label, name, value, onChange, rows, type = 'text', placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-terruno-muted mb-1">{label}</label>
    {rows ? (
      <textarea id={name} name={name} rows={rows} value={value || ''} onChange={onChange} className={INPUT_CLASS} />
    ) : (
      <input id={name} type={type} name={name} placeholder={placeholder} value={value || ''} onChange={onChange} className={INPUT_CLASS} />
    )}
  </div>
);

interface ContactFieldProps extends Omit<TextFieldProps, 'rows'> {
  icon: React.ReactNode;
  showKey: FlagKey;
  show: boolean;
  onToggle: (key: FlagKey, value: boolean) => void;
}

const ContactField: React.FC<ContactFieldProps> = ({ label, name, value, onChange, type, placeholder, icon, showKey, show, onToggle }) => (
  <div>
    <div className="mb-1 flex items-center justify-between gap-3">
      <label htmlFor={name} className="block text-sm font-medium text-terruno-muted">{label}</label>
      <label className="flex items-center gap-2 text-xs text-terruno-muted">
        <input type="checkbox" checked={show} onChange={(e) => onToggle(showKey, e.target.checked)} className="rounded text-terruno-burgundy" />
        Mostrar en footer
      </label>
    </div>
    <div className="relative">
      <span className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 flex">{icon}</span>
      <input id={name} type={type || 'text'} name={name} placeholder={placeholder} value={value || ''} onChange={onChange} className={`${INPUT_CLASS} pl-10`} />
    </div>
  </div>
);

interface ImageUploadProps {
  name: ImageField;
  label: string;
  preview?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, field: ImageField) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ name, label, preview, onChange }) => (
  <div className="space-y-2">
    <span className="block text-sm font-medium text-terruno-muted">{label}</span>
    <div className="flex flex-col sm:flex-row items-start gap-4">
      <div className="flex-1 w-full">
        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-terruno-border border-dashed rounded-xl cursor-pointer bg-terruno-bg hover:bg-terruno-border/50 transition-colors">
          <div className="flex flex-col items-center justify-center">
            <UploadSimple className="w-5 h-5 mb-1 text-terruno-muted" />
            <p className="text-xs text-terruno-muted">Clic para subir foto</p>
          </div>
          <input type="file" accept="image/*" className="hidden" aria-label={label} onChange={(e) => onChange(e, name)} />
        </label>
      </div>
      {preview ? (
        <div className="w-24 h-24 rounded-xl border border-terruno-border overflow-hidden bg-terruno-bg flex-shrink-0">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-24 h-24 rounded-xl border border-terruno-border border-dashed bg-terruno-bg flex-shrink-0 flex items-center justify-center text-terruno-muted">
          <ImageIcon className="w-6 h-6 opacity-50" />
        </div>
      )}
    </div>
  </div>
);

/** Configuración de la tienda y la landing pública (tabla `store_info`); la lógica vive en useStoreSettings. */
export const SettingsForm: React.FC = () => {
  const { formData, previews, loading, saving, errorMsg, successMsg, setField, handleChange, handleImageChange, handleSave } = useStoreSettings();
  const text = { onChange: handleChange };
  const contact = { ...text, onToggle: setField };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <CircleNotch className="w-8 h-8 text-terruno-burgundy animate-spin" />
      </div>
    );
  }

  return (
    <section className="view-section active" style={{ overflowY: 'auto', paddingBottom: '3rem' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-serif font-bold text-terruno-brown">Configuración de la Tienda</h1>

        {errorMsg && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">{errorMsg}</div>}
        {successMsg && <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100">{successMsg}</div>}

        <form onSubmit={handleSave} className="space-y-6">
          <Card icon={<Storefront className="w-5 h-5" />} title="Información Básica">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label="Nombre de la Tienda" name="name" value={formData.name} {...text} />
              <TextField label="Eslogan" name="tagline" value={formData.tagline} {...text} />
            </div>
            <ImageUpload name="logo" label="Logo de la Tienda" preview={previews.logo} onChange={handleImageChange} />
          </Card>

          <Card icon={<Phone className="w-5 h-5" />} title="Contacto y Ubicación">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ContactField label="Teléfono" name="phone" value={formData.phone} icon={<Phone size={16} />} showKey="show_phone" show={formData.show_phone !== false} {...contact} />
              <ContactField label="Número de WhatsApp" name="whatsapp_number" placeholder="ej. +5493525518649" value={formData.whatsapp_number} icon={<WhatsappLogo size={16} />} showKey="show_whatsapp" show={formData.show_whatsapp !== false} {...contact} />
              <ContactField label="Correo Electrónico" name="email" type="email" value={formData.email} icon={<Envelope size={16} />} showKey="show_email" show={formData.show_email !== false} {...contact} />
              <ContactField label="Dirección Física" name="address" value={formData.address} icon={<MapPin size={16} />} showKey="show_address" show={formData.show_address !== false} {...contact} />
              <ContactField label="Perfil de Instagram (URL)" name="instagram_url" type="url" placeholder="ej. https://instagram.com/terruno" value={formData.instagram_url} icon={<InstagramLogo size={16} />} showKey="show_instagram" show={formData.show_instagram !== false} {...contact} />
            </div>
          </Card>

          <Card icon={<Clock className="w-5 h-5" />} title="Horarios de Atención">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DayHoursEditor label="Lunes a Viernes" value={formData.hours_weekdays} onChange={(val) => setField('hours_weekdays', val)} />
              <DayHoursEditor label="Sábados" value={formData.hours_saturday} onChange={(val) => setField('hours_saturday', val)} />
              <DayHoursEditor label="Domingos" value={formData.hours_sunday} onChange={(val) => setField('hours_sunday', val)} />
            </div>
          </Card>

          <Card icon={<Layout className="w-5 h-5" />} title="Sección Principal (Inicio)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label="Etiqueta Principal (Badge)" name="hero_badge" value={formData.hero_badge} {...text} />
              <TextField label="Título Principal" name="hero_title" value={formData.hero_title} {...text} />
            </div>
            <TextField label="Subtítulo" name="hero_subtitle" value={formData.hero_subtitle} {...text} />
            <ImageUpload name="hero_bg_image" label="Imagen de Fondo" preview={previews.hero_bg_image} onChange={handleImageChange} />
          </Card>

          <Card icon={<Info className="w-5 h-5" />} title='Sección "Nuestra Historia"'>
            <TextField label='Título de "Nuestra Historia"' name="about_title" value={formData.about_title} {...text} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label="Cita / Frase" name="about_quote" rows={3} value={formData.about_quote} {...text} />
              <TextField label="Autor de la Frase" name="about_quote_author" value={formData.about_quote_author} {...text} />
            </div>
            <div className="space-y-4">
              <TextField label="Párrafo 1" name="about_paragraph_1" rows={3} value={formData.about_paragraph_1} {...text} />
              <TextField label="Párrafo 2" name="about_paragraph_2" rows={3} value={formData.about_paragraph_2} {...text} />
              <TextField label="Párrafo 3" name="about_paragraph_3" rows={3} value={formData.about_paragraph_3} {...text} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageUpload name="about_main_image" label="Imagen Principal" preview={previews.about_main_image} onChange={handleImageChange} />
              <ImageUpload name="about_sub_image" label="Imagen Secundaria" preview={previews.about_sub_image} onChange={handleImageChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <TextField label="Estadística: Años" name="stat_years" value={formData.stat_years} {...text} />
              <TextField label="Estadística: Productores" name="stat_producers" value={formData.stat_producers} {...text} />
              <TextField label="Estadística: Productos" name="stat_products" value={formData.stat_products} {...text} />
            </div>
          </Card>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-terruno-burgundy text-white px-8 py-3 rounded-xl hover:bg-terruno-burgundy-light transition-colors disabled:opacity-70 disabled:cursor-not-allowed font-medium shadow-sm"
            >
              {saving ? <CircleNotch className="w-5 h-5 animate-spin" /> : <FloppyDisk className="w-5 h-5" />}
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SettingsForm;
