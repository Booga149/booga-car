import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import ProductDetailsClient from './ProductDetailsClient';

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const id = params.id;

  try {
    const { data } = await supabase.from('products').select('name, brand, category, price, image_url').eq('id', id).single();

    if (!data) {
      return {
        title: 'المنتج غير موجود | Booga Car',
        description: 'هذا المنتج غير متوفر حالياً في متجر بوجا كار.'
      }
    }

    return {
      title: `${data.name} | ${data.brand} | Booga Car`,
      description: `اشترِ ${data.name} بأفضل الأسعار. متاح الآن في قسم ${data.category} بسعر ${data.price} ريال.`,
      openGraph: {
        title: `${data.name} | Booga Car`,
        description: `اشترِ ${data.name} بأفضل الأسعار في قسم ${data.category}.`,
        images: [{ url: data.image_url || '', width: 800, height: 600, alt: data.name }],
        type: 'website',
        siteName: 'Booga Car'
      },
    }
  } catch {
    return { title: 'Booga Car', description: 'متجر قطع غيار السيارات' };
  }
}

export default function ProductDetailsServerPage({ params }: Props) {
  return <ProductDetailsClient id={params.id} />;
}
