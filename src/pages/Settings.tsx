import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import TypeManagement from "@/components/settings/TypeManagement";
import DurationManagement from "@/components/settings/DurationManagement";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { deviceTypes, updateDeviceType } from "@/lib/deviceTypes";
import { formatIDRInput, parseIDRInput } from "@/lib/data";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface SettingsForm {
  rates: Record<string, string>;
  sessionWarningTime: string;
}

const Settings = () => {
  const [refresh, setRefresh] = useState(0);
  const { theme, setTheme } = useTheme();

  const form = useForm<SettingsForm>({
    defaultValues: {
      rates: Object.fromEntries(deviceTypes.map(type => [type.value, type.hourlyRate.toString()])),
      sessionWarningTime: "5",
    }
  });

  // Re-sync form values when deviceTypes change (after fetch)
  useEffect(() => {
    form.reset({
      rates: Object.fromEntries(deviceTypes.map(type => [type.value, type.hourlyRate.toString()])),
      sessionWarningTime: "5",
    });
  }, [deviceTypes.length, refresh]);

  const onSubmit = async (data: SettingsForm) => {
    try {
      // Update hourly rates in DB
      for (const type of deviceTypes) {
        if (data.rates[type.value] && Number(data.rates[type.value]) !== type.hourlyRate) {
          await updateDeviceType(type.id, {
            hourlyRate: Number(data.rates[type.value])
          });
        }
      }
      
      toast.success('Settings updated successfully');
      setRefresh(prev => prev + 1);
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="gaming-card h-fit">
            <CardHeader>
              <CardTitle>Management</CardTitle>
              <CardDescription>Manage your store assets and options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <DurationManagement />
              <div className="border-t pt-8">
                <TypeManagement />
              </div>
            </CardContent>
          </Card>

          <Card className="gaming-card h-fit">
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>Customize how the interface looks on your device</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Appearance Mode</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={theme === 'light' ? 'default' : 'outline'}
                    className="flex flex-col items-center gap-2 py-8 h-auto"
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="h-5 w-5" />
                    <span className="text-xs">Light</span>
                  </Button>
                  <Button 
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    className="flex flex-col items-center gap-2 py-8 h-auto"
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="h-5 w-5" />
                    <span className="text-xs">Dark</span>
                  </Button>
                  <Button 
                    variant={theme === 'system' ? 'default' : 'outline'}
                    className="flex flex-col items-center gap-2 py-8 h-auto"
                    onClick={() => setTheme('system')}
                  >
                    <Monitor className="h-5 w-5" />
                    <span className="text-xs">System</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gaming-card h-fit">
            <CardHeader>
              <CardTitle>Pricing Configuration</CardTitle>
              <CardDescription>Configure hourly rates for different device types</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {deviceTypes.map((type) => (
                    <FormField
                      key={type.value}
                      control={form.control}
                      name={`rates.${type.value}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{type.name} Rate (Rp/jam)</FormLabel>
                          <FormControl>
                            <Input 
                              type="text" 
                              {...field} 
                              value={field.value ? formatIDRInput(field.value) : ''}
                              onChange={(e) => field.onChange(parseIDRInput(e.target.value).toString())}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                  
                  <FormField
                    control={form.control}
                    name="sessionWarningTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Warning Time (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Save Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
