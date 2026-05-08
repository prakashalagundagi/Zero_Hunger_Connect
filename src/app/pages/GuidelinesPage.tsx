import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { AlertTriangle, CheckCircle2, Thermometer, Clock, Package, Users, ShieldCheck, Heart } from 'lucide-react';

export function GuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Food Safety Guidelines</h1>
        <p className="text-gray-600">
          Essential guidelines for safe food donation, handling, and distribution
        </p>
      </div>

      {/* Important Notice */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-900">
          <strong>Important:</strong> Food safety is our top priority. Please follow these guidelines
          to ensure all donated food is safe for consumption and helps those in need effectively.
        </AlertDescription>
      </Alert>

      {/* Key Principles */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">What to Donate</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Fresh, uncontaminated food</li>
                  <li>• Properly stored items</li>
                  <li>• Food within expiry dates</li>
                  <li>• Sealed packaged goods</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">What NOT to Donate</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Expired or spoiled food</li>
                  <li>• Opened perishable items</li>
                  <li>• Unrefrigerated dairy/meat</li>
                  <li>• Home-canned goods</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Safety Guidelines</CardTitle>
          <CardDescription>Click to expand each section for more information</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {/* Temperature Control */}
            <AccordionItem value="temperature">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-blue-600" />
                  <span>Temperature Control</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <h4 className="font-medium mb-2">Cold Foods (below 40°F / 4°C)</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Keep refrigerated items at 40°F (4°C) or below</li>
                      <li>Use insulated containers or coolers for transport</li>
                      <li>Include ice packs to maintain temperature</li>
                      <li>Minimize time outside refrigeration (max 2 hours)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Hot Foods (above 140°F / 60°C)</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Keep hot foods at 140°F (60°C) or higher</li>
                      <li>Use insulated containers for transport</li>
                      <li>Deliver within 2 hours of preparation</li>
                      <li>Never leave at room temperature</li>
                    </ul>
                  </div>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>Danger Zone:</strong> Bacteria multiply rapidly between 40°F-140°F (4°C-60°C).
                      Never leave food in this temperature range for more than 2 hours.
                    </AlertDescription>
                  </Alert>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Time Guidelines */}
            <AccordionItem value="time">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span>Time Guidelines</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <h4 className="font-medium mb-2">Prepared Foods</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Donate within 2 hours of cooking</li>
                      <li>Label with preparation time</li>
                      <li>Consume within 4 hours of donation</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Fresh Produce</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Donate on the day of purchase/harvest</li>
                      <li>Inspect for spoilage before donating</li>
                      <li>Wash fruits and vegetables before distribution</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Packaged Foods</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Check expiration dates</li>
                      <li>Donate at least 1 week before expiry</li>
                      <li>Ensure packaging is intact and sealed</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Packaging & Storage */}
            <AccordionItem value="packaging">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-600" />
                  <span>Packaging & Storage</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-gray-700">
                  <h4 className="font-medium">Proper Packaging Requirements:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Use food-grade containers only</li>
                    <li>Ensure all containers are clean and sanitized</li>
                    <li>Seal containers properly to prevent contamination</li>
                    <li>Label with contents, date, and allergen information</li>
                    <li>Use separate containers for different food types</li>
                    <li>Include serving utensils if applicable</li>
                  </ul>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <h5 className="font-medium text-blue-900 mb-2">Labeling Checklist:</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ Food name and description</li>
                      <li>✓ Preparation/packaging date and time</li>
                      <li>✓ Expiry or "best before" date</li>
                      <li>✓ Allergen warnings (nuts, dairy, gluten, etc.)</li>
                      <li>✓ Storage instructions</li>
                      <li>✓ Reheating instructions (if applicable)</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Handling & Hygiene */}
            <AccordionItem value="hygiene">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>Handling & Hygiene</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-gray-700">
                  <h4 className="font-medium">Personal Hygiene:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm mb-4">
                    <li>Wash hands thoroughly before handling food</li>
                    <li>Wear clean clothes and aprons</li>
                    <li>Tie back long hair</li>
                    <li>Avoid handling food if sick</li>
                    <li>Use gloves when appropriate</li>
                  </ul>
                  
                  <h4 className="font-medium">Safe Handling Practices:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Use clean utensils and equipment</li>
                    <li>Avoid cross-contamination (raw/cooked foods)</li>
                    <li>Store food off the floor</li>
                    <li>Keep food covered when not in use</li>
                    <li>Transport food in clean vehicles</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Allergens & Dietary Restrictions */}
            <AccordionItem value="allergens">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-red-600" />
                  <span>Allergens & Dietary Restrictions</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-gray-700">
                  <h4 className="font-medium">Common Allergens to Label:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-red-50 rounded p-2">• Peanuts</div>
                    <div className="bg-red-50 rounded p-2">• Tree nuts</div>
                    <div className="bg-red-50 rounded p-2">• Milk/Dairy</div>
                    <div className="bg-red-50 rounded p-2">• Eggs</div>
                    <div className="bg-red-50 rounded p-2">• Wheat/Gluten</div>
                    <div className="bg-red-50 rounded p-2">• Soy</div>
                    <div className="bg-red-50 rounded p-2">• Fish</div>
                    <div className="bg-red-50 rounded p-2">• Shellfish</div>
                  </div>
                  <Alert className="bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-sm text-red-900">
                      <strong>Critical:</strong> Always clearly label all allergens. Unlabeled allergens
                      can cause severe reactions. When in doubt, list all ingredients.
                    </AlertDescription>
                  </Alert>
                  <div className="mt-3">
                    <h4 className="font-medium mb-2">Consider Dietary Needs:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Vegetarian and vegan options</li>
                      <li>Halal and kosher requirements</li>
                      <li>Low-sodium alternatives</li>
                      <li>Diabetic-friendly options</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Transportation */}
            <AccordionItem value="transport">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  <span>Transportation Best Practices</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-gray-700">
                  <h4 className="font-medium">Vehicle Preparation:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm mb-4">
                    <li>Clean vehicle interior before transport</li>
                    <li>Use dedicated food transport containers</li>
                    <li>Avoid transporting food with strong odors or chemicals</li>
                    <li>Maintain appropriate temperature during transport</li>
                  </ul>
                  
                  <h4 className="font-medium">During Transport:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm mb-4">
                    <li>Secure containers to prevent spills</li>
                    <li>Keep hot and cold foods separated</li>
                    <li>Minimize transport time (under 30 minutes ideal)</li>
                    <li>Avoid direct sunlight on food items</li>
                  </ul>

                  <h4 className="font-medium">Upon Delivery:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Verify recipient information</li>
                    <li>Communicate any special handling instructions</li>
                    <li>Ensure proper handoff and acknowledgment</li>
                    <li>Report any issues immediately</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Quick Reference Card */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
        <CardHeader>
          <CardTitle>Quick Reference: 4 Golden Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <h4 className="font-semibold text-gray-900">Clean</h4>
              </div>
              <p className="text-sm text-gray-700">
                Wash hands, utensils, and surfaces often. Prevent contamination.
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <h4 className="font-semibold text-gray-900">Separate</h4>
              </div>
              <p className="text-sm text-gray-700">
                Keep raw and cooked foods separate to avoid cross-contamination.
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <h4 className="font-semibold text-gray-900">Cook/Cool</h4>
              </div>
              <p className="text-sm text-gray-700">
                Maintain proper temperatures: below 40°F or above 140°F.
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  4
                </div>
                <h4 className="font-semibold text-gray-900">Label</h4>
              </div>
              <p className="text-sm text-gray-700">
                Clearly mark contents, dates, and allergens on all donations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-blue-900">
          <strong>Questions or Concerns?</strong> If you're unsure about food safety or have concerns
          about a donation, please contact our support team or local health department before proceeding.
        </AlertDescription>
      </Alert>
    </div>
  );
}
